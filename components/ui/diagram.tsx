'use client'

/**
 * Diagram Component
 * Mermaid diagram renderer for system visualizations
 * Uses singleton loader to prevent race conditions and duplicate script tags
 */

import React, { useEffect, useRef } from 'react'
import { loadMermaid } from '@/lib/mermaid-loader'

declare global {
  interface Window {
    mermaid?: {
      initialize: (config: Record<string, unknown>) => void
      render: (id: string, code: string) => Promise<{ svg: string }>
      contentLoaded: () => void
    }
  }
}

export interface DiagramProps {
  mermaidCode: string
  title?: string
  theme?: 'light' | 'dark'
  className?: string
}

export function Diagram({ mermaidCode, title, theme = 'dark', className = '' }: DiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Use singleton loader to ensure Mermaid loads exactly once
    const initializeMermaid = async () => {
      try {
        const success = await loadMermaid()
        if (!success) {
          if (mounted) {
            setError('Failed to load Mermaid library')
          }
          return
        }

        if (mounted && window.mermaid) {
          window.mermaid.initialize({
            startOnLoad: true,
            theme: theme === 'dark' ? 'dark' : 'default',
          })
          setIsLoaded(true)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize Mermaid')
        }
      }
    }

    initializeMermaid()

    return () => {
      mounted = false
    }
  }, [theme])

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return

    const renderDiagram = async () => {
      try {
        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }

        // Render Mermaid diagram with valid CSS selector ID
        const diagramId = 'diagram-' + Math.random().toString().replace('.', '-')
        const { svg } = await window.mermaid!.render(diagramId, mermaidCode)

        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        console.error('Diagram rendering error:', err)
      }
    }

    renderDiagram()
  }, [mermaidCode, isLoaded])

  if (error) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {title && <h4 className="font-semibold">{title}</h4>}
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700 text-sm">
          <p className="font-medium">Error rendering diagram</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {title && <h4 className="font-semibold">{title}</h4>}
        <div className="p-8 border rounded-lg bg-muted animate-pulse">
          <div className="h-64 bg-muted-foreground/10 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {title && <h4 className="font-semibold">{title}</h4>}
      <div
        ref={containerRef}
        className="overflow-auto border rounded-lg bg-background p-4 flex justify-center"
        style={{ minHeight: '300px' }}
      />
    </div>
  )
}

export default Diagram
