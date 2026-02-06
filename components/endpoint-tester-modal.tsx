'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Copy, CheckCircle2, XCircle, Clock, Terminal } from 'lucide-react'
import { MCPEndpoint } from '@/lib/mcp-endpoints'

interface EndpointTesterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  endpoint: MCPEndpoint
  baseUrl: string
}

interface TestResult {
  success: boolean
  status: number
  response_time_ms: number
  error: string | null
  response_data?: unknown
}

export function EndpointTesterModal({
  open,
  onOpenChange,
  endpoint,
  baseUrl,
}: EndpointTesterModalProps) {
  const [userId, setUserId] = useState('60') // Default test user
  const [customParams, setCustomParams] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [copiedCurl, setCopiedCurl] = useState(false)

  // Generate curl command
  const generateCurlCommand = () => {
    const fullUrl = `${baseUrl}${endpoint.endpoint}`
    const params: Record<string, unknown> = {}

    // Add user_id if required
    if (endpoint.requiresUserId) {
      params.user_id = parseInt(userId) || 60
    }

    // Add custom params if provided
    if (customParams.trim()) {
      try {
        const parsed = JSON.parse(customParams)
        Object.assign(params, parsed)
      } catch {
        // Invalid JSON, ignore
      }
    }

    if (endpoint.method === 'GET') {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          },
          {} as Record<string, string>
        )
      ).toString()
      return `curl -X GET "${fullUrl}${queryString ? `?${queryString}` : ''}" \\
  -H "Content-Type: application/json"`
    }

    return `curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(params, null, 2)}'`
  }

  const handleCopyCurl = async () => {
    const curlCommand = generateCurlCommand()
    await navigator.clipboard.writeText(curlCommand)
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
  }

  const handleRunTest = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      const params: Record<string, unknown> = {}

      // Add user_id if required
      if (endpoint.requiresUserId) {
        params.user_id = parseInt(userId) || 60
      }

      // Add custom params if provided
      if (customParams.trim()) {
        try {
          const parsed = JSON.parse(customParams)
          Object.assign(params, parsed)
        } catch {
          setTestResult({
            success: false,
            status: 0,
            response_time_ms: 0,
            error: 'Invalid JSON in custom parameters',
          })
          setIsTesting(false)
          return
        }
      }

      // Call the test API route
      const response = await fetch(`/api/v2/endpoints/${endpoint.taskId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: endpoint.requiresUserId ? parseInt(userId) || 7 : undefined, // V2 default user
          params,
        }),
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        status: 0,
        response_time_ms: 0,
        error: error instanceof Error ? error.message : 'Request failed',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 500) return 'text-green-600'
    if (ms < 1000) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatJson = (data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Test Endpoint: {endpoint.taskName}
          </DialogTitle>
          <DialogDescription>{endpoint.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Endpoint Info */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Method:</span>{' '}
                <Badge variant={endpoint.method === 'POST' ? 'default' : 'secondary'}>
                  {endpoint.method}
                </Badge>
              </div>
              <div>
                <span className="font-semibold">API Group:</span>{' '}
                <Badge variant="outline">{endpoint.apiGroup}</Badge>
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Endpoint:</span>{' '}
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {baseUrl}
                  {endpoint.endpoint}
                </code>
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="space-y-3">
            {endpoint.requiresUserId && (
              <div>
                <Label htmlFor="user_id">User ID (required)</Label>
                <Input
                  id="user_id"
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="60"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="custom_params">Custom Parameters (JSON)</Label>
              <textarea
                id="custom_params"
                value={customParams}
                onChange={(e) => setCustomParams(e.target.value)}
                placeholder='{"key": "value"}'
                className="mt-1 w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
              />
            </div>
          </div>

          {/* Curl Command Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>cURL Command</Label>
              <Button variant="ghost" size="sm" onClick={handleCopyCurl} className="h-8 text-xs">
                {copiedCurl ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
              {generateCurlCommand()}
            </pre>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className="space-y-2">
              <Label>Test Result</Label>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-600">Success</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-semibold text-red-600">Failed</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Status: {testResult.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span
                      className={`text-sm font-semibold ${formatResponseTime(testResult.response_time_ms)}`}
                    >
                      {testResult.response_time_ms}ms
                    </span>
                  </div>
                </div>

                {testResult.error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                    <span className="font-semibold">Error:</span> {testResult.error}
                  </div>
                )}

                {testResult.response_data !== undefined && testResult.response_data !== null ? (
                  <div className="space-y-2">
                    <div className="font-semibold text-sm">Response Data:</div>
                    <pre className="bg-background p-3 rounded text-xs overflow-x-auto max-h-[300px] overflow-y-auto">
                      {formatJson(testResult.response_data)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleRunTest} disabled={isTesting}>
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Test'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
