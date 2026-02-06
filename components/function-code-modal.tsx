'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, ExternalLink, Code2, GitCompareArrows } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getAdminUrl } from '@/lib/workspace-config'

interface FunctionCodeModalProps {
  functionId: number
  workspace: '1' | '5'
  functionName: string
  isOpen: boolean
  onClose: () => void
}

export function FunctionCodeModal({
  functionId,
  workspace,
  functionName,
  isOpen,
  onClose,
}: FunctionCodeModalProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !functionId) return

    let cancelled = false

    const fetchData = async () => {
      try {
        const r = await fetch(`/api/function/${functionId}?workspace=${workspace}`)
        const data = await r.json()
        if (cancelled) return
        if (data.success) {
          setData(data.function)
        } else {
          setError(data.error || 'Failed to load function')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    setLoading(true)
    setError(null)
    fetchData()

    return () => {
      cancelled = true
    }
  }, [isOpen, functionId, workspace])

  const copyCode = () => {
    if (data?.code) {
      navigator.clipboard.writeText(JSON.stringify(data.code, null, 2))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            {functionName}
            <Badge variant="outline" className="ml-2">
              {workspace === '1' ? 'V1' : 'V2'} Workspace {workspace}
            </Badge>
          </DialogTitle>
          <DialogDescription>Function ID: {functionId}</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading function details...</span>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-600">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* Function Metadata */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-mono">{data.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p>{data.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p>{data.created ? new Date(data.created).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Modified:</span>
                    <p>
                      {data.last_modified ? new Date(data.last_modified).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  {data.tags && data.tags.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Function Inputs */}
            {data.inputs && data.inputs.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <GitCompareArrows className="h-4 w-4" />
                    Inputs
                  </h3>
                  <div className="space-y-2">
                    {data.inputs.map((input: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <Badge variant="outline">{input.type || 'text'}</Badge>
                        <code className="font-mono">{input.name}</code>
                        {input.required && (
                          <Badge variant="destructive" className="text-xs">
                            required
                          </Badge>
                        )}
                        {input.default && (
                          <span className="text-muted-foreground">= {input.default}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* XanoScript Code */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    XanoScript Code
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(getAdminUrl(workspace, `function/${functionId}`), '_blank')
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Code
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="text-amber-600 shrink-0">⚠️</div>
                    <div className="text-sm">
                      <p className="font-medium text-amber-900 mb-1">
                        XanoScript Code Retrieval Currently Limited
                      </p>
                      <p className="text-amber-700 mb-2">
                        The code retrieval service has a parameter issue that prevents viewing full
                        function source code directly in this interface.
                      </p>
                      <p className="text-amber-700">
                        Click "Open in Xano" above to view the complete XanoScript code in the Xano
                        admin interface.
                      </p>
                    </div>
                  </div>
                </div>

                {data.code && (
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs mt-4">
                    <code>{JSON.stringify(data.code, null, 2)}</code>
                  </pre>
                )}
                {data.stack && (
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs mt-4">
                    <code>{JSON.stringify(data.stack, null, 2)}</code>
                  </pre>
                )}
              </CardContent>
            </Card>

            {/* Raw Response (for debugging) */}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Show raw API response
              </summary>
              <pre className="mt-2 bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{JSON.stringify(data, null, 2)}</code>
              </pre>
            </details>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
