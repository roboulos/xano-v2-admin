'use client'

/**
 * Diagram Component
 * Enhanced Mermaid diagram renderer with custom theming
 * Supports light/dark mode with beautiful, professional styling
 */

import React, { useEffect, useRef, useState } from 'react'
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
  theme?: 'light' | 'dark' | 'auto'
  variant?: 'default' | 'forest' | 'neutral' | 'ocean' | 'sunset'
  className?: string
}

// Custom theme configurations for beautiful diagrams
const getThemeConfig = (theme: 'light' | 'dark', variant: string) => {
  const themes = {
    // Ocean theme - blues and cyans
    ocean: {
      light: {
        primaryColor: '#0ea5e9',
        primaryTextColor: '#0c4a6e',
        primaryBorderColor: '#0284c7',
        secondaryColor: '#e0f2fe',
        secondaryTextColor: '#075985',
        secondaryBorderColor: '#38bdf8',
        tertiaryColor: '#f0f9ff',
        tertiaryTextColor: '#0369a1',
        tertiaryBorderColor: '#7dd3fc',
        noteBkgColor: '#f0f9ff',
        noteTextColor: '#0c4a6e',
        noteBorderColor: '#38bdf8',
        lineColor: '#0284c7',
        textColor: '#1e293b',
        mainBkg: '#ffffff',
        actorBkg: '#e0f2fe',
        actorBorder: '#0284c7',
        actorTextColor: '#0c4a6e',
        actorLineColor: '#64748b',
        signalColor: '#0284c7',
        signalTextColor: '#1e293b',
        labelBoxBkgColor: '#e0f2fe',
        labelBoxBorderColor: '#0284c7',
        labelTextColor: '#0c4a6e',
        loopTextColor: '#0c4a6e',
        activationBorderColor: '#0284c7',
        activationBkgColor: '#e0f2fe',
        sequenceNumberColor: '#ffffff',
      },
      dark: {
        primaryColor: '#0ea5e9',
        primaryTextColor: '#f0f9ff',
        primaryBorderColor: '#38bdf8',
        secondaryColor: '#0c4a6e',
        secondaryTextColor: '#e0f2fe',
        secondaryBorderColor: '#0284c7',
        tertiaryColor: '#082f49',
        tertiaryTextColor: '#bae6fd',
        tertiaryBorderColor: '#0369a1',
        noteBkgColor: '#0c4a6e',
        noteTextColor: '#e0f2fe',
        noteBorderColor: '#0284c7',
        lineColor: '#38bdf8',
        textColor: '#f1f5f9',
        mainBkg: '#0f172a',
        actorBkg: '#0c4a6e',
        actorBorder: '#38bdf8',
        actorTextColor: '#e0f2fe',
        actorLineColor: '#64748b',
        signalColor: '#38bdf8',
        signalTextColor: '#f1f5f9',
        labelBoxBkgColor: '#0c4a6e',
        labelBoxBorderColor: '#38bdf8',
        labelTextColor: '#e0f2fe',
        loopTextColor: '#bae6fd',
        activationBorderColor: '#38bdf8',
        activationBkgColor: '#0c4a6e',
        sequenceNumberColor: '#0c4a6e',
      },
    },
    // Forest theme - greens
    forest: {
      light: {
        primaryColor: '#22c55e',
        primaryTextColor: '#14532d',
        primaryBorderColor: '#16a34a',
        secondaryColor: '#dcfce7',
        secondaryTextColor: '#166534',
        secondaryBorderColor: '#4ade80',
        tertiaryColor: '#f0fdf4',
        tertiaryTextColor: '#15803d',
        tertiaryBorderColor: '#86efac',
        noteBkgColor: '#f0fdf4',
        noteTextColor: '#14532d',
        noteBorderColor: '#4ade80',
        lineColor: '#16a34a',
        textColor: '#1e293b',
        mainBkg: '#ffffff',
        actorBkg: '#dcfce7',
        actorBorder: '#16a34a',
        actorTextColor: '#14532d',
        actorLineColor: '#64748b',
        signalColor: '#16a34a',
        signalTextColor: '#1e293b',
        labelBoxBkgColor: '#dcfce7',
        labelBoxBorderColor: '#16a34a',
        labelTextColor: '#14532d',
        loopTextColor: '#14532d',
        activationBorderColor: '#16a34a',
        activationBkgColor: '#dcfce7',
        sequenceNumberColor: '#ffffff',
      },
      dark: {
        primaryColor: '#22c55e',
        primaryTextColor: '#f0fdf4',
        primaryBorderColor: '#4ade80',
        secondaryColor: '#14532d',
        secondaryTextColor: '#dcfce7',
        secondaryBorderColor: '#16a34a',
        tertiaryColor: '#052e16',
        tertiaryTextColor: '#bbf7d0',
        tertiaryBorderColor: '#15803d',
        noteBkgColor: '#14532d',
        noteTextColor: '#dcfce7',
        noteBorderColor: '#16a34a',
        lineColor: '#4ade80',
        textColor: '#f1f5f9',
        mainBkg: '#0f172a',
        actorBkg: '#14532d',
        actorBorder: '#4ade80',
        actorTextColor: '#dcfce7',
        actorLineColor: '#64748b',
        signalColor: '#4ade80',
        signalTextColor: '#f1f5f9',
        labelBoxBkgColor: '#14532d',
        labelBoxBorderColor: '#4ade80',
        labelTextColor: '#dcfce7',
        loopTextColor: '#bbf7d0',
        activationBorderColor: '#4ade80',
        activationBkgColor: '#14532d',
        sequenceNumberColor: '#14532d',
      },
    },
    // Sunset theme - oranges and purples
    sunset: {
      light: {
        primaryColor: '#f97316',
        primaryTextColor: '#431407',
        primaryBorderColor: '#ea580c',
        secondaryColor: '#ffedd5',
        secondaryTextColor: '#9a3412',
        secondaryBorderColor: '#fb923c',
        tertiaryColor: '#fff7ed',
        tertiaryTextColor: '#c2410c',
        tertiaryBorderColor: '#fdba74',
        noteBkgColor: '#faf5ff',
        noteTextColor: '#581c87',
        noteBorderColor: '#c084fc',
        lineColor: '#ea580c',
        textColor: '#1e293b',
        mainBkg: '#ffffff',
        actorBkg: '#ffedd5',
        actorBorder: '#ea580c',
        actorTextColor: '#431407',
        actorLineColor: '#64748b',
        signalColor: '#ea580c',
        signalTextColor: '#1e293b',
        labelBoxBkgColor: '#ffedd5',
        labelBoxBorderColor: '#ea580c',
        labelTextColor: '#431407',
        loopTextColor: '#431407',
        activationBorderColor: '#ea580c',
        activationBkgColor: '#ffedd5',
        sequenceNumberColor: '#ffffff',
      },
      dark: {
        primaryColor: '#f97316',
        primaryTextColor: '#fff7ed',
        primaryBorderColor: '#fb923c',
        secondaryColor: '#431407',
        secondaryTextColor: '#ffedd5',
        secondaryBorderColor: '#ea580c',
        tertiaryColor: '#1c0a00',
        tertiaryTextColor: '#fed7aa',
        tertiaryBorderColor: '#c2410c',
        noteBkgColor: '#2e1065',
        noteTextColor: '#e9d5ff',
        noteBorderColor: '#a855f7',
        lineColor: '#fb923c',
        textColor: '#f1f5f9',
        mainBkg: '#0f172a',
        actorBkg: '#431407',
        actorBorder: '#fb923c',
        actorTextColor: '#ffedd5',
        actorLineColor: '#64748b',
        signalColor: '#fb923c',
        signalTextColor: '#f1f5f9',
        labelBoxBkgColor: '#431407',
        labelBoxBorderColor: '#fb923c',
        labelTextColor: '#ffedd5',
        loopTextColor: '#fed7aa',
        activationBorderColor: '#fb923c',
        activationBkgColor: '#431407',
        sequenceNumberColor: '#431407',
      },
    },
    // Neutral theme - slates and grays (professional)
    neutral: {
      light: {
        primaryColor: '#64748b',
        primaryTextColor: '#1e293b',
        primaryBorderColor: '#475569',
        secondaryColor: '#f1f5f9',
        secondaryTextColor: '#334155',
        secondaryBorderColor: '#94a3b8',
        tertiaryColor: '#f8fafc',
        tertiaryTextColor: '#475569',
        tertiaryBorderColor: '#cbd5e1',
        noteBkgColor: '#fefce8',
        noteTextColor: '#713f12',
        noteBorderColor: '#facc15',
        lineColor: '#475569',
        textColor: '#1e293b',
        mainBkg: '#ffffff',
        actorBkg: '#f1f5f9',
        actorBorder: '#475569',
        actorTextColor: '#1e293b',
        actorLineColor: '#94a3b8',
        signalColor: '#475569',
        signalTextColor: '#1e293b',
        labelBoxBkgColor: '#f1f5f9',
        labelBoxBorderColor: '#475569',
        labelTextColor: '#1e293b',
        loopTextColor: '#334155',
        activationBorderColor: '#475569',
        activationBkgColor: '#e2e8f0',
        sequenceNumberColor: '#ffffff',
      },
      dark: {
        primaryColor: '#94a3b8',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#cbd5e1',
        secondaryColor: '#1e293b',
        secondaryTextColor: '#e2e8f0',
        secondaryBorderColor: '#64748b',
        tertiaryColor: '#0f172a',
        tertiaryTextColor: '#cbd5e1',
        tertiaryBorderColor: '#475569',
        noteBkgColor: '#422006',
        noteTextColor: '#fef9c3',
        noteBorderColor: '#eab308',
        lineColor: '#94a3b8',
        textColor: '#f1f5f9',
        mainBkg: '#0f172a',
        actorBkg: '#1e293b',
        actorBorder: '#64748b',
        actorTextColor: '#f1f5f9',
        actorLineColor: '#475569',
        signalColor: '#94a3b8',
        signalTextColor: '#f1f5f9',
        labelBoxBkgColor: '#1e293b',
        labelBoxBorderColor: '#64748b',
        labelTextColor: '#f1f5f9',
        loopTextColor: '#cbd5e1',
        activationBorderColor: '#64748b',
        activationBkgColor: '#334155',
        sequenceNumberColor: '#1e293b',
      },
    },
    // Default theme - balanced blues/purples (matches app theme)
    default: {
      light: {
        primaryColor: '#6366f1',
        primaryTextColor: '#312e81',
        primaryBorderColor: '#4f46e5',
        secondaryColor: '#e0e7ff',
        secondaryTextColor: '#3730a3',
        secondaryBorderColor: '#818cf8',
        tertiaryColor: '#eef2ff',
        tertiaryTextColor: '#4338ca',
        tertiaryBorderColor: '#a5b4fc',
        noteBkgColor: '#fef3c7',
        noteTextColor: '#92400e',
        noteBorderColor: '#fbbf24',
        lineColor: '#4f46e5',
        textColor: '#1e293b',
        mainBkg: '#ffffff',
        actorBkg: '#e0e7ff',
        actorBorder: '#4f46e5',
        actorTextColor: '#312e81',
        actorLineColor: '#64748b',
        signalColor: '#4f46e5',
        signalTextColor: '#1e293b',
        labelBoxBkgColor: '#e0e7ff',
        labelBoxBorderColor: '#4f46e5',
        labelTextColor: '#312e81',
        loopTextColor: '#3730a3',
        activationBorderColor: '#4f46e5',
        activationBkgColor: '#c7d2fe',
        sequenceNumberColor: '#ffffff',
      },
      dark: {
        primaryColor: '#818cf8',
        primaryTextColor: '#eef2ff',
        primaryBorderColor: '#a5b4fc',
        secondaryColor: '#312e81',
        secondaryTextColor: '#e0e7ff',
        secondaryBorderColor: '#6366f1',
        tertiaryColor: '#1e1b4b',
        tertiaryTextColor: '#c7d2fe',
        tertiaryBorderColor: '#4338ca',
        noteBkgColor: '#451a03',
        noteTextColor: '#fef3c7',
        noteBorderColor: '#f59e0b',
        lineColor: '#818cf8',
        textColor: '#f1f5f9',
        mainBkg: '#0f172a',
        actorBkg: '#312e81',
        actorBorder: '#818cf8',
        actorTextColor: '#e0e7ff',
        actorLineColor: '#64748b',
        signalColor: '#818cf8',
        signalTextColor: '#f1f5f9',
        labelBoxBkgColor: '#312e81',
        labelBoxBorderColor: '#818cf8',
        labelTextColor: '#e0e7ff',
        loopTextColor: '#c7d2fe',
        activationBorderColor: '#818cf8',
        activationBkgColor: '#3730a3',
        sequenceNumberColor: '#1e1b4b',
      },
    },
  }

  const themeConfig = themes[variant as keyof typeof themes] || themes.default
  return themeConfig[theme]
}

export function Diagram({
  mermaidCode,
  title,
  theme = 'auto',
  variant = 'default',
  className = '',
}: DiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // For 'auto' theme, we need to track system preference changes
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Subscribe to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches)
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Derive the resolved theme from props and system preference
  const resolvedTheme: 'light' | 'dark' =
    theme === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : theme

  useEffect(() => {
    let mounted = true

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
          const themeVariables = getThemeConfig(resolvedTheme, variant)

          window.mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables,
            flowchart: {
              htmlLabels: true,
              curve: 'basis',
              padding: 20,
              nodeSpacing: 50,
              rankSpacing: 60,
              useMaxWidth: true,
            },
            sequence: {
              diagramMarginX: 20,
              diagramMarginY: 20,
              actorMargin: 80,
              width: 180,
              height: 50,
              boxMargin: 10,
              boxTextMargin: 8,
              noteMargin: 15,
              messageMargin: 40,
              mirrorActors: true,
              bottomMarginAdj: 10,
              useMaxWidth: true,
              showSequenceNumbers: false,
              wrap: true,
              wrapPadding: 10,
            },
            er: {
              diagramPadding: 20,
              layoutDirection: 'TB',
              minEntityWidth: 100,
              minEntityHeight: 75,
              entityPadding: 15,
              stroke: themeVariables.lineColor,
              fill: themeVariables.primaryColor,
              fontSize: 14,
              useMaxWidth: true,
            },
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: 14,
            securityLevel: 'loose',
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
  }, [resolvedTheme, variant])

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return

    const renderDiagram = async () => {
      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }

        const diagramId = 'diagram-' + Math.random().toString().replace('.', '-')
        const { svg } = await window.mermaid!.render(diagramId, mermaidCode)

        if (containerRef.current) {
          containerRef.current.innerHTML = svg

          // Post-process SVG for better styling
          const svgElement = containerRef.current.querySelector('svg')
          if (svgElement) {
            svgElement.style.maxWidth = '100%'
            svgElement.style.height = 'auto'
            svgElement.style.borderRadius = '8px'
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        console.error('Diagram rendering error:', err)
      }
    }

    renderDiagram()
  }, [mermaidCode, isLoaded, resolvedTheme])

  if (error) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {title && <h4 className="font-semibold">{title}</h4>}
        <div
          className="p-4 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--status-error-bg)',
            border: '1px solid var(--status-error-border)',
            color: 'var(--status-error)',
          }}
        >
          <p className="font-medium">Error rendering diagram</p>
          <p className="text-xs mt-1 opacity-80">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {title && <h4 className="font-semibold">{title}</h4>}
        <div className="p-8 border rounded-lg bg-muted/50 animate-pulse">
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
        className="overflow-auto rounded-xl p-6 flex justify-center transition-colors"
        style={{
          minHeight: '300px',
          backgroundColor: resolvedTheme === 'dark' ? '#0f172a' : '#ffffff',
          border: `1px solid ${resolvedTheme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
          boxShadow:
            resolvedTheme === 'dark'
              ? 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)'
              : 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        }}
      />
    </div>
  )
}

export default Diagram
