'use client'

/**
 * Diagram Component
 * Mermaid diagram renderer for system visualizations
 */

import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    mermaid?: {
      initialize: (config: Record<string, unknown>) => void
      render: (id: string, code: string) => Promise<{ svg: string }>
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

    // Load Mermaid script
    if (typeof window !== 'undefined' && !window.mermaid) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js'
      script.async = true
      script.onload = () => {
        if (mounted) {
          window.mermaid!.initialize({
            startOnLoad: true,
            theme: theme === 'dark' ? 'dark' : 'default',
          })
          setIsLoaded(true)
        }
      }
      script.onerror = () => {
        if (mounted) {
          setError('Failed to load Mermaid library')
        }
      }
      document.body.appendChild(script)
    } else if (window.mermaid && mounted) {
      setTimeout(() => {
        if (mounted) {
          setIsLoaded(true)
        }
      }, 0)
    }

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

        // Render Mermaid diagram
        const { svg } = await window.mermaid!.render('diagram-' + Math.random(), mermaidCode)

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
